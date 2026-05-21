import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as ctrl from "./controller";
const authRouter = Router();

authRouter.post("/register", ctrl.RegisterUserController);

authRouter.post("/login", ctrl.LoginUserController);

authRouter.post("/refresh", ctrl.refreshTokenController);

authRouter.get("/me", requireAuth, ctrl.meController);

authRouter.post("/logout", requireAuth, ctrl.logoutController);

export default authRouter;
