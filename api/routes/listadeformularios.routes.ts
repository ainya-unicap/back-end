import { Router } from "express";
import { ListaDeFormulariosController } from "../controllers/listadeformularios.controller.js";

const listadeformulariosRouter = Router();

listadeformulariosRouter.post("/", ListaDeFormulariosController.create);
listadeformulariosRouter.get("/:listaId", ListaDeFormulariosController.findById);

export default listadeformulariosRouter;
    