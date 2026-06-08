import { Router } from "express";
import { InstitutionController } from "../controllers/institution.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const institutionRouter = Router();

// Público: a tela de cadastro precisa listar as instituições antes do login.
institutionRouter.get("/", InstitutionController.getAll);

// Protegidos: precisam de Bearer accessToken
institutionRouter.get("/:id", requireAuth, InstitutionController.findById);
institutionRouter.post("/", requireAuth, InstitutionController.create);
institutionRouter.put("/:id", requireAuth, InstitutionController.update);
institutionRouter.delete("/:id", requireAuth, InstitutionController.delete);

export default institutionRouter;
