import { Router } from "express";
import { PlantaForrageiraController } from "../controllers/plantaForrageira.controller";

const plantaForrageiraRouter = Router();

plantaForrageiraRouter.get("/", PlantaForrageiraController.findAll);

export default plantaForrageiraRouter;
