import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as ctrl from "./controller";

const billingRouter = Router();

billingRouter.use(requireAuth);

billingRouter.get("/", ctrl.getBilling);
billingRouter.get("/history", ctrl.getUsageHistory);
billingRouter.get("/plans", ctrl.getPlans);
billingRouter.post("/upgrade", ctrl.requestUpgrade);

export default billingRouter;
