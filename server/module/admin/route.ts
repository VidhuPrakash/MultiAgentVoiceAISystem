import { Router } from "express";
import { requireAdmin } from "../../middleware/auth";
import * as ctrl from "./controller";

const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get("/stats", ctrl.getStats);
adminRouter.get("/usage", ctrl.getUsage);

adminRouter.get("/users", ctrl.getUsers);
adminRouter.post("/users", ctrl.createUser);
adminRouter.get("/users/:id", ctrl.getUser);
adminRouter.patch("/users/:id", ctrl.updateUser);
adminRouter.delete("/users/:id", ctrl.deleteUser);
adminRouter.post("/users/:id/block", ctrl.blockUser);
adminRouter.post("/users/:id/unblock", ctrl.unblockUser);
adminRouter.patch("/users/:id/plan", ctrl.setPlan);

adminRouter.get("/agents", ctrl.getAgents);
adminRouter.patch("/agents/:id", ctrl.updateAgent);

adminRouter.get("/calls", ctrl.getCalls);
adminRouter.get("/calls/:id", ctrl.getCall);

export default adminRouter;
