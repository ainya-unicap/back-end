import { Router } from "express";
import { PlantaForrageiraController } from "../controllers/plantaforrageira.controller.js";

const plantaforrageiraRouter = Router();

plantaforrageiraRouter.get("/", PlantaForrageiraController.findAll);

export default plantaforrageiraRouter;
