import { Router } from "express";
import { FormularioController } from "../controllers/formulario.controller.js";
import { ChecklistController } from "../controllers/checklist.controller.js";
import { MeasurementController } from "../controllers/measurement.controller.js";
import { PhotoController } from "../controllers/photo.controller.js";
import { upload } from "../middlewares/upload.middleware.js";

const formularioRouter = Router();

formularioRouter.get("/", FormularioController.findAllByUser);
formularioRouter.get("/user/:userId", FormularioController.findAllByUser);
formularioRouter.get("/:id", FormularioController.findById);
formularioRouter.get("/:id/checklist", FormularioController.getChecklist);
formularioRouter.get("/:id/measurements", FormularioController.getMeasurements);
formularioRouter.get("/:id/photos", FormularioController.getPhotos);

formularioRouter.post("/", FormularioController.create);
formularioRouter.post("/:id/checklist", ChecklistController.createManyForFormulario);
formularioRouter.post("/:id/measurements", MeasurementController.createManyForFormulario);

formularioRouter.post(
    "/:id/photos",
    upload.single("photo"),
    PhotoController.createForFormulario
);

formularioRouter.put("/:id", FormularioController.update);
formularioRouter.patch("/:id", FormularioController.update);
formularioRouter.delete("/:id", FormularioController.delete);
formularioRouter.post("/:id/finalizar", FormularioController.finalizar);
formularioRouter.patch("/:id/finalizar", FormularioController.finalizar);
formularioRouter.post("/:id/sync", FormularioController.sync);


export default formularioRouter;