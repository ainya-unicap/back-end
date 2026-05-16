import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { AuthController } from "../controllers/auth.controller.js";

const userRouter = Router();

userRouter.post("/", UserController.create);
userRouter.post("/login", AuthController.login);
userRouter.get("/", UserController.getAll);
            
export default userRouter;
    