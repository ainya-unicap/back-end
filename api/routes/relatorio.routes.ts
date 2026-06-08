import { Router } from "express";
import { RelatorioController } from "../controllers/relatorio.controller.js";

const relatorioRouter = Router();

relatorioRouter.get("/user/:userId", RelatorioController.findByUser);
relatorioRouter.get("/usuario/:userId", RelatorioController.findByUser);
relatorioRouter.post("/generate", RelatorioController.generate);

relatorioRouter.get("/:id", RelatorioController.findById);
relatorioRouter.put("/:id", RelatorioController.update);
relatorioRouter.delete("/:id", RelatorioController.delete);

relatorioRouter.patch("/:id/objetivo", RelatorioController.updateObjective);
relatorioRouter.put("/:id/objective", RelatorioController.updateObjective);
relatorioRouter.put("/:id/introduction", RelatorioController.updateIntroduction);
relatorioRouter.put("/:id/development", RelatorioController.updateDevelopment);
relatorioRouter.put("/:id/final-thoughts", RelatorioController.updateFinalThoughts);
relatorioRouter.put("/:id/references", RelatorioController.updateReferences);

relatorioRouter.post("/:id/submit", RelatorioController.submit);
relatorioRouter.get("/:id/export-pdf", RelatorioController.exportPdf);

export default relatorioRouter;
