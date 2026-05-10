import { Router } from "express";
import { CanteiroController } from "../controllers/canteiro.controller";

const canteiroRouter = Router();

canteiroRouter.get("/usuario/:userId", CanteiroController.findByUser);
canteiroRouter.post("/", CanteiroController.create);

export default canteiroRouter;
