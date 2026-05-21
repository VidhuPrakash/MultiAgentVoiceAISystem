import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  LoginUserController,
  logoutController,
  meController,
  refreshTokenController,
  RegisterUserController,
} from "./controller";
const authRouter = Router();

authRouter.post("/register", RegisterUserController);

authRouter.post("/login", LoginUserController);

authRouter.post("/refresh", refreshTokenController);

authRouter.get("/me", requireAuth, meController);

authRouter.post("/logout", requireAuth, logoutController);

export default authRouter;
