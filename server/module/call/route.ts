import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as ctrl from "./controller";

const callRouter = Router();

callRouter.use(requireAuth);

callRouter.get("/", ctrl.listCalls);
callRouter.get("/stats", ctrl.getCallStats);
callRouter.get("/:id", ctrl.getCall);

export default callRouter;
