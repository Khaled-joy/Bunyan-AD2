import { Router, type IRouter } from "express";
import { clearAdminSession, isAdminRequest, issueAdminSession, matchesAdminPassword } from "../lib/admin-auth";

const router: IRouter = Router();

router.post("/admin/auth/login", (request, response) => {
  const password = typeof request.body?.password === "string" ? request.body.password : "";
  if (!password || password.length > 512) {
    response.status(400).json({ error: "A password is required." });
    return;
  }
  if (!matchesAdminPassword(password)) {
    response.status(401).json({ error: "Incorrect password." });
    return;
  }
  issueAdminSession(response);
  response.status(204).end();
});

router.get("/admin/auth/me", (request, response) => {
  if (!isAdminRequest(request)) {
    response.status(401).json({ error: "Admin authentication is required." });
    return;
  }
  response.json({ role: "admin" });
});

router.post("/admin/auth/logout", (_request, response) => {
  clearAdminSession(response);
  response.status(204).end();
});

export default router;