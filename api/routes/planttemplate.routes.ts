import { Router } from "express";
import { PlantTemplateController } from "../controllers/planttemplate.controller.js";

const planttemplateRouter = Router();

planttemplateRouter.get("/", PlantTemplateController.findAllByPlant);
planttemplateRouter.get("/plant/:plantId", PlantTemplateController.findAllByPlant);
planttemplateRouter.get("/:id", PlantTemplateController.findById);
planttemplateRouter.post("/", PlantTemplateController.create);
planttemplateRouter.put("/:id", PlantTemplateController.update);
planttemplateRouter.delete("/:id", PlantTemplateController.delete);

export default planttemplateRouter;
