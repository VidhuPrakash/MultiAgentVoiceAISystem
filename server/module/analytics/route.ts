import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as ctrl from "./controller";

const userAnalyticsRouter = Router();

userAnalyticsRouter.use(requireAuth);

userAnalyticsRouter.get("/summary", ctrl.getSummary);
userAnalyticsRouter.get("/calls-over-time", ctrl.getCallsOverTime);
userAnalyticsRouter.get("/call-status", ctrl.getCallStatus);
userAnalyticsRouter.get("/agent-performance", ctrl.getAgentPerformance);
userAnalyticsRouter.get("/minutes-over-time", ctrl.getMinutesOverTime);
userAnalyticsRouter.get("/recent-leads", ctrl.getRecentLeads);

export default userAnalyticsRouter;
