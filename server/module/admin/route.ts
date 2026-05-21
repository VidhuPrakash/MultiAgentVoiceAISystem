import { Router } from "express";
import { requireAdmin } from "../../middleware/auth";
import * as ctrl from "./controller";

const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get("/users", ctrl.getUsers);
adminRouter.post("/users", ctrl.createUser);
adminRouter.get("/users/:id", ctrl.getUser);
adminRouter.patch("/users/:id", ctrl.updateUser);
adminRouter.delete("/users/:id", ctrl.deleteUser);
adminRouter.post("/users/:id/block", ctrl.blockUser);
adminRouter.post("/users/:id/unblock", ctrl.unblockUser);
adminRouter.get("/agents", ctrl.getAgents);
adminRouter.patch("/agents/:id", ctrl.updateAgent);

adminRouter.get("/calls", ctrl.getCalls);
adminRouter.get("/calls/:id", ctrl.getCall);

adminRouter.get("/analytics/summary", ctrl.getDashboardSummary);
adminRouter.get("/analytics/users-over-time", ctrl.getUsersOverTime);       
adminRouter.get("/analytics/plan-distribution", ctrl.getPlanDistribution);
adminRouter.get("/analytics/top-minutes-users", ctrl.getTopMinutesUsers);
adminRouter.get("/analytics/calls-over-time", ctrl.getCallsOverTime);      
adminRouter.get("/analytics/call-status", ctrl.getCallStatusDistribution);
adminRouter.get("/analytics/avg-call-duration", ctrl.getAvgCallDuration);

export default adminRouter;
