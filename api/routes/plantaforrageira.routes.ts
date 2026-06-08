import { Router } from "express";
import { PlantaForrageiraController } from "../controllers/plantaforrageira.controller.js";

const plantaforrageiraRouter = Router();

plantaforrageiraRouter.get("/", PlantaForrageiraController.findAll);
plantaforrageiraRouter.get("/:id", PlantaForrageiraController.findById);
plantaforrageiraRouter.post("/", PlantaForrageiraController.create);
plantaforrageiraRouter.put("/:id", PlantaForrageiraController.update);
plantaforrageiraRouter.delete("/:id", PlantaForrageiraController.delete);

export default plantaforrageiraRouter;
