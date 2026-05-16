
import { Router } from "express";
import { InstitutionController } from "../controllers/institution.controller.js";
            
const institutionRouter = Router();
            
//cadastro
institutionRouter.post("/", InstitutionController.create);
//listar
institutionRouter.get("/", InstitutionController.getAll);
            
export default institutionRouter;
    