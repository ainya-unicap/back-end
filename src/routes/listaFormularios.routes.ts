import { Router } from "express";
import { ListaFormulariosController } from "../controllers/listaFormularios.controller";

const listaFormulariosRouter = Router();

listaFormulariosRouter.post("/", ListaFormulariosController.create);
listaFormulariosRouter.get("/:listaId", ListaFormulariosController.findById);

export default listaFormulariosRouter;
