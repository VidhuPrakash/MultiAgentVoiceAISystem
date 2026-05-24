import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as ctrl from "./controller";

const leadsRouter = Router();

leadsRouter.use(requireAuth);

leadsRouter.get("/", ctrl.listLeads);
leadsRouter.get("/stats", ctrl.getLeadStats);
leadsRouter.get("/:id", ctrl.getLead);

export default leadsRouter;
