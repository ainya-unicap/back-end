import { Router } from "express";
import userRouter from "./user.routes";
import canteiroRouter from "./canteiro.routes";
import plantaForrageiraRouter from "./plantaForrageira.routes";
import listaFormulariosRouter from "./listaFormularios.routes";

const routes = Router();

routes.use("/users", userRouter);
routes.use("/canteiros", canteiroRouter);
routes.use("/plantas-forrageiras", plantaForrageiraRouter);
routes.use("/listas-formularios", listaFormulariosRouter);

export default routes;
