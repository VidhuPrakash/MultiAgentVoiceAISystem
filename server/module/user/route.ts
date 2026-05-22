import { Router } from "express";
import * as ctrl from "./controller";
import { requireAuth } from "../../middleware/auth";

const userAgentRouter = Router();

userAgentRouter.use(requireAuth);

userAgentRouter.get("/", ctrl.listAgents);
userAgentRouter.post("/", ctrl.createAgent);
userAgentRouter.get("/:id", ctrl.getAgent);
userAgentRouter.patch("/:id", ctrl.updateAgent);
userAgentRouter.delete("/:id", ctrl.deleteAgent);

export default userAgentRouter;
